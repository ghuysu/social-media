import {
  AWS_S3_SERVICE,
  ChangeBirthdayDto,
  ChangeCountryDto,
  ChangeEmailDto,
  ChangeFullnameDto,
  CheckCodeToChangeEmailDto,
  createTTL,
  DeleteAccountDto,
  DeleteFriendDto,
  FEED_SERVICE,
  FriendInviteDocument,
  FriendInviteStatus,
  MESSAGE_SERVICE,
  NOTIFICATION_SERVICE,
  RemoveInviteDto,
  SendInviteDto,
  STATISTIC_SERVICE,
  TokenPayloadInterface,
  UserDocument,
} from '@app/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { UserRepository } from './repositories/user.repository';
import { ClientProxy } from '@nestjs/microservices';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as Jimp from 'jimp';
import { ChangeEmailPayloadInterface } from './interfaces/change-email-payload.interface';
import { FriendInviteRepository } from './repositories/friend-invite.repository';
import { Types } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly friendInviteRepository: FriendInviteRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,
    @Inject(AWS_S3_SERVICE)
    private readonly awss3Client: ClientProxy,
    @Inject(FEED_SERVICE)
    private readonly feedClient: ClientProxy,
    @Inject(MESSAGE_SERVICE)
    private readonly messageClient: ClientProxy,
    @Inject(STATISTIC_SERVICE)
    private readonly statisticClient: ClientProxy,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  private createImageNameFromOriginalname(originalname: string): string {
    const timestamp = new Date().getTime();
    return `${timestamp}_${originalname.split('.').shift()}`;
  }

  private createDefaultImageNameFromFullname(fullname: string): string {
    let imageName = fullname.split(' ').join('_');
    //get current time
    const timestamp = new Date().getTime();
    imageName = `default_${timestamp}_${imageName}`;
    return imageName;
  }

  private async createDefaultProfileImage(fullname: string): Promise<Buffer> {
    // Lấy chữ cái đầu tiên của tên và họ
    const firstnameLetter = fullname.split(' ')[0].charAt(0).toUpperCase();
    const lastnameLetter = fullname.split(' ')[1].charAt(0).toUpperCase();
    const name = `${firstnameLetter} ${lastnameLetter}`;

    // Tạo ảnh mới với kích thước 100x100 và nền đen
    const image = new Jimp(100, 100, '#000000');

    // Tải font chữ
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

    // Vị trí của văn bản trong ảnh
    const textPosition = {
      text: name,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    };

    // Thêm văn bản vào ảnh
    image.print(font, 0, 0, textPosition, 100, 100);

    // Trả về Buffer thay vì lưu file
    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    return buffer;
  }

  async getUser({ email, userId, role }: TokenPayloadInterface) {
    let needToSaveIntoRedis = false;

    // Generate key based on role
    const cacheKey = `${role === 'normal_user' ? 'user' : 'admin'}:${email}`;

    //get from redis
    // Get from Redis
    let account: UserDocument = await this.cacheManager.get(cacheKey);

    //if redis don't have, check from db
    if (!account) {
      needToSaveIntoRedis = true;

      if (role === 'normal_user') {
        account = await this.userRepository.findOne(
          {
            _id: userId,
          },
          [
            { path: 'friendList', select: '_id fullname profileImageUrl' },
            {
              path: 'friendInvites',
              select: '_id sender receiver createdAt',
              populate: [
                {
                  path: 'sender',
                  select: '_id fullname profileImageUrl',
                },
                {
                  path: 'receiver',
                  select: '_id fullname profileImageUrl',
                },
              ],
            },
          ],
        );
      } else {
        account = await this.userRepository.findOne({
          _id: userId,
        });
      }

      if (!account) {
        throw new NotFoundException(`Resources not found`);
      }

      // Remove sensitive data
      delete account.password;
    }

    // Set into Redis if necessary
    if (needToSaveIntoRedis) {
      await this.cacheManager.set(cacheKey, account, {
        ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
      });
    }

    //return
    return account;
  }

  async changeBirthday(
    { email, userId, role }: TokenPayloadInterface,
    { birthday }: ChangeBirthdayDto,
  ) {
    //update infor in db
    let updatedUser;

    try {
      updatedUser = await this.userRepository.findOneAndUpdate(
        { _id: userId },
        { birthday: birthday },
        [
          { path: 'friendList', select: '_id fullname profileImageUrl' },
          {
            path: 'friendInvites',
            select: '_id sender receiver createdAt',
            populate: [
              {
                path: 'sender',
                select: '_id fullname profileImageUrl',
              },
              {
                path: 'receiver',
                select: '_id fullname profileImageUrl',
              },
            ],
          },
        ],
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Not Found Resource');
      }
      throw new InternalServerErrorException('Something is wrong');
    }

    //delete sensetive data
    delete updatedUser.password;

    // Generate key based on role
    const cacheKey = `${role === 'normal_user' ? 'user' : 'admin'}:${email}`;

    //update cache
    await this.cacheManager.set(cacheKey, updatedUser, {
      ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
    });

    //return
    return updatedUser;
  }

  async changeFullname(
    { email, userId }: TokenPayloadInterface,
    { fullname }: ChangeFullnameDto,
  ) {
    //get redis infor
    let infor: UserDocument = await this.cacheManager.get(`user:${email}`);

    if (!infor) {
      infor = await this.userRepository.findOne({ _id: userId });
    }

    if (!infor) {
      throw new NotFoundException('Not Found Resource');
    }

    //check image is default or not
    const imageName = infor.profileImageUrl.split('/').pop();
    const isDefaultImage = imageName.startsWith('default');

    //if default image, create new default image base on new fullname
    if (isDefaultImage) {
      //delete old image
      this.awss3Client.emit('delete_image', {
        imageName: imageName,
      });

      //create new default image
      const newImageName = this.createDefaultImageNameFromFullname(fullname);

      const image = await this.createDefaultProfileImage(fullname);

      //upload new default image
      this.awss3Client.emit('upload_image', {
        image,
        imageName: newImageName,
      });

      const profileImageUrl = `https://${this.configService.get('BUCKET_NAME')}.s3.${this.configService.get(
        'AWSS3_REGION',
      )}.amazonaws.com/${newImageName}`;

      infor.profileImageUrl = profileImageUrl;
    }

    //update infor in db
    let updatedUser;

    try {
      updatedUser = await this.userRepository.findOneAndUpdate(
        { _id: userId },
        { fullname: fullname, profileImageUrl: infor.profileImageUrl },
        [
          { path: 'friendList', select: '_id fullname profileImageUrl' },
          {
            path: 'friendInvites',
            select: '_id sender receiver createdAt',
            populate: [
              {
                path: 'sender',
                select: '_id fullname profileImageUrl',
              },
              {
                path: 'receiver',
                select: '_id fullname profileImageUrl',
              },
            ],
          },
        ],
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Not Found Resource');
      }
      throw new InternalServerErrorException('Something is wrong');
    }

    //delete sensetive data
    delete updatedUser.password;

    //update cache
    await this.cacheManager.set(`user:${email}`, updatedUser, {
      ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
    });

    //emit message to all client
    this.notificationClient.emit('emit_message', {
      name: 'change_fullname',
      payload: {
        userId: updatedUser._id.toHexString(),
        metadata: {
          fullname: updatedUser.fullname,
          profileImageUrl: updatedUser.profileImageUrl,
        },
      },
    });

    //return
    return updatedUser;
  }

  async changeCountry(
    { email, userId, role }: TokenPayloadInterface,
    { country }: ChangeCountryDto,
  ) {
    //update infor in db
    let updatedUser: UserDocument;

    let user: UserDocument;

    try {
      user = await this.userRepository.findOne({
        _id: userId,
      });
      updatedUser = await this.userRepository.findOneAndUpdate(
        { _id: userId },
        { country: country },
        [
          { path: 'friendList', select: '_id fullname profileImageUrl' },
          {
            path: 'friendInvites',
            select: '_id sender receiver createdAt',
            populate: [
              {
                path: 'sender',
                select: '_id fullname profileImageUrl',
              },
              {
                path: 'receiver',
                select: '_id fullname profileImageUrl',
              },
            ],
          },
        ],
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Not Found Resource');
      }
      throw new InternalServerErrorException('Something is wrong');
    }
    //delete sensetive data
    delete updatedUser.password;

    // Generate key based on role
    const cacheKey = `${role === 'normal_user' ? 'user' : 'admin'}:${email}`;

    //update cache
    await this.cacheManager.set(cacheKey, updatedUser, {
      ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
    });

    //update country statistic
    this.statisticClient.emit('change_country', {
      newCountry: country,
      oldCountry: user.country,
    });

    //return
    return updatedUser;
  }

  async changeProfileImage(
    { email, userId, role }: TokenPayloadInterface,
    image: Buffer,
    originalname: string,
  ) {
    // Generate key based on role
    const cacheKey = `${role === 'normal_user' ? 'user' : 'admin'}:${email}`;

    //get redis infor
    let infor: UserDocument = await this.cacheManager.get(cacheKey);

    if (!infor) {
      infor = await this.userRepository.findOne({ _id: userId });
    }

    if (!infor) {
      throw new NotFoundException('Not Found Resource');
    }

    //delete prev image
    const prevImageName: string = infor.profileImageUrl.split('/').pop();
    console.log(prevImageName);

    this.awss3Client.emit('delete_image', {
      imageName: prevImageName,
    });

    //upload new image
    const imageName = this.createImageNameFromOriginalname(originalname);
    console.log(imageName);

    this.awss3Client.emit('upload_image', {
      image,
      imageName,
    });

    const profileImageUrl = `https://${this.configService.get('BUCKET_NAME')}.s3.${this.configService.get(
      'AWSS3_REGION',
    )}.amazonaws.com/${imageName}`;

    //update db
    let updatedUser;

    try {
      updatedUser = await this.userRepository.findOneAndUpdate(
        { _id: userId },
        { profileImageUrl: profileImageUrl },
        [
          { path: 'friendList', select: '_id fullname profileImageUrl' },
          {
            path: 'friendInvites',
            select: '_id sender receiver createdAt',
            populate: [
              {
                path: 'sender',
                select: '_id fullname profileImageUrl',
              },
              {
                path: 'receiver',
                select: '_id fullname profileImageUrl',
              },
            ],
          },
        ],
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Not Found Resource');
      }
      throw new InternalServerErrorException('Something is wrong');
    }

    //remove sensitive infor
    delete updatedUser.password;

    //update redis
    this.cacheManager.set(cacheKey, updatedUser, {
      ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
    });

    //emit message to all client
    this.notificationClient.emit('emit_message', {
      name: 'change_profile_image',
      payload: {
        userId: updatedUser._id.toHexString(),
        metadata: {
          profileImageUrl: updatedUser.profileImageUrl,
        },
      },
    });

    return updatedUser;
  }

  async changeEmail(
    { email }: TokenPayloadInterface,
    { newEmail }: ChangeEmailDto,
  ) {
    //check email is registered or not
    //get from redis
    let registeredUser: UserDocument = await this.cacheManager.get(
      `user:${newEmail}`,
    );

    if (!registeredUser) {
      registeredUser = await this.userRepository.findOne(
        {
          email: newEmail,
          role: 'normal_user',
        },
        [
          { path: 'friendList', select: '_id fullname profileImageUrl' },
          {
            path: 'friendInvites',
            select: '_id sender receiver createdAt',
            populate: [
              {
                path: 'sender',
                select: '_id fullname profileImageUrl',
              },
              {
                path: 'receiver',
                select: '_id fullname profileImageUrl',
              },
            ],
          },
        ],
      );
    }

    //if true throw error
    if (registeredUser) {
      delete registeredUser.password;
      await this.cacheManager.set(
        `user:${registeredUser.email}`,
        registeredUser,
        {
          ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
        },
      );

      throw new ConflictException('Duplicate Resource');
    }

    //create code
    //create a 6-digit validation code
    const code = Math.floor(100000 + Math.random() * 900000);

    //hash code
    const hashedCode = await argon2.hash(code.toString(), {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 4,
      parallelism: 2,
      secret: Buffer.from(this.configService.get('ARGON2_SERCET')),
    });

    //send event to notification service to send code
    //to this email
    this.notificationClient.emit('send_code_to_change_email', {
      email: newEmail,
      code,
    });

    //save code in redis and ttl is 5p
    this.cacheManager.set(
      `change_email_code:${email}`,
      { code: hashedCode, newEmail, oldEmail: email },
      {
        ttl: createTTL(60 * 5, 0),
      },
    );
  }

  async checkCodeToChangeEmail(
    { email, userId }: TokenPayloadInterface,
    { code, newEmail }: CheckCodeToChangeEmailDto,
  ) {
    //check code in redis
    const infor: ChangeEmailPayloadInterface = await this.cacheManager.get(
      `change_email_code:${email}`,
    );

    //if can't get code throw expired code exception
    if (!infor) {
      throw new BadRequestException('Expired Resource');
    }

    //if incorrect throw incorrect exception
    const { code: correctCode, newEmail: _newEmail, oldEmail } = infor;

    const isCorrectCode = await argon2.verify(
      correctCode.toString(),
      code.toString(),
      {
        secret: Buffer.from(this.configService.get('ARGON2_SERCET')),
      },
    );

    if (!isCorrectCode || (_newEmail !== newEmail && oldEmail !== email)) {
      throw new BadRequestException('Incorrect Resource');
    }

    //delete code cache
    this.cacheManager.del(`change_email_code:${email}`);

    //if true update db
    let updatedUser;
    try {
      updatedUser = await this.userRepository.findOneAndUpdate(
        { _id: userId },
        { email: newEmail },
        [
          { path: 'friendList', select: '_id fullname profileImageUrl' },
          {
            path: 'friendInvites',
            select: '_id sender receiver createdAt',
            populate: [
              {
                path: 'sender',
                select: '_id fullname profileImageUrl',
              },
              {
                path: 'receiver',
                select: '_id fullname profileImageUrl',
              },
            ],
          },
        ],
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Not Found Resource');
      }
      throw new InternalServerErrorException('Something is wrong');
    }

    //delete sensitive infor
    delete updatedUser.password;

    //save update into redis
    this.cacheManager.del(`user:${email}`);
    this.cacheManager.set(`user:${updatedUser.email}`, updatedUser, {
      ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
    });

    //create new sign in token
    const tokenPayload: TokenPayloadInterface = {
      userId: updatedUser._id,
      email: updatedUser.email,
      role: updatedUser.role,
    };

    const signInToken = await this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: `${this.configService.get('JWT_EXPIRATION_USER')}s`,
    });

    // Prepend 'Bearer ' to the token
    const bearerToken = `Bearer ${signInToken}`;

    //return infor
    return {
      user: updatedUser,
      signInToken: bearerToken,
    };
  }

  async getStrangerInfor(userId) {
    //get infor from db
    const infor: UserDocument = await this.userRepository.findOne({
      _id: userId,
    });

    //if not found throw not found exception
    if (!infor) {
      throw new NotFoundException('Not Found Resouces');
    }

    //if have, return needed infor
    return {
      _id: infor._id,
      profileImageUrl: infor.profileImageUrl,
      fullname: infor.fullname,
    };
  }

  async sendInvite(
    { email, userId }: TokenPayloadInterface,
    { userId: friendId }: SendInviteDto,
  ) {
    //get user infor
    let user: UserDocument = await this.cacheManager.get(`user:${email}`);

    if (!user) {
      user = await this.userRepository.findOne({ _id: userId }, [
        { path: 'friendList', select: '_id fullname profileImageUrl' },
        {
          path: 'friendInvites',
          select: '_id sender receiver createdAt',
          populate: [
            {
              path: 'sender',
              select: '_id fullname profileImageUrl',
            },
            {
              path: 'receiver',
              select: '_id fullname profileImageUrl',
            },
          ],
        },
      ]);

      //if user infor not found throw not found exception
      if (!user) {
        throw new NotFoundException('Not Found Resource');
      }
    }

    this.cacheManager.set(`user:${email}`, user, {
      ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
    });

    //check if they are already friends
    const isAlreadyFriends = user.friendList.some(
      (friend) => friend._id.toString() === friendId.toString(),
    );

    if (isAlreadyFriends) {
      throw new BadRequestException('Processed Resources');
    }

    //check if invite has sent
    const sentInvites = user.friendInvites.some(
      (f) => f.receiver._id.toString() === friendId.toString(),
    );

    const receiveInvites = user.friendInvites.some(
      (f) => f.sender._id.toString() === friendId.toString(),
    );

    if (sentInvites || receiveInvites) {
      throw new ConflictException('Duplicate Resources');
    }

    //check if friend is existing or not
    const friend = await this.userRepository.findOne({ _id: friendId });

    if (!friend) {
      throw new NotFoundException('Not Found Resources');
    }

    //create friend invite record
    const friendInviteRecord = await this.friendInviteRepository.create({
      sender: userId,
      receiver: friendId,
    });

    //update user and friend records
    const [updatedUser, updatedFriend] = await Promise.all([
      this.userRepository.findOneAndUpdate(
        { _id: userId },
        { $push: { friendInvites: friendInviteRecord._id } },
        [
          { path: 'friendList', select: '_id fullname profileImageUrl' },
          {
            path: 'friendInvites',
            select: '_id sender receiver createdAt',
            populate: [
              {
                path: 'sender',
                select: '_id fullname profileImageUrl',
              },
              {
                path: 'receiver',
                select: '_id fullname profileImageUrl',
              },
            ],
          },
        ],
      ),

      this.userRepository.findOneAndUpdate(
        { _id: friendId },
        { $push: { friendInvites: friendInviteRecord._id } },
        [
          { path: 'friendList', select: '_id fullname profileImageUrl' },
          {
            path: 'friendInvites',
            select: '_id sender receiver createdAt',
            populate: [
              {
                path: 'sender',
                select: '_id fullname profileImageUrl',
              },
              {
                path: 'receiver',
                select: '_id fullname profileImageUrl',
              },
            ],
          },
        ],
      ),
    ]);

    //delete sensitive infor
    delete updatedUser.password;
    delete updatedFriend.password;

    //update redis
    this.cacheManager.set(`user:${updatedUser.email}`, updatedUser, {
      ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
    });

    this.cacheManager.set(`user:${updatedFriend.email}`, updatedFriend, {
      ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
    });

    this.cacheManager.set(
      `friend_invite:${friendInviteRecord._id}`,
      friendInviteRecord,
      {
        ttl: createTTL(60 * 60 * 24 * 30, 60 * 60 * 24),
      },
    );

    //emit friend infor
    this.notificationClient.emit('emit_message', {
      name: 'send_invite',
      payload: {
        userId: updatedFriend._id.toHexString(),
        metadata: {
          ...friendInviteRecord,
          sender: {
            _id: updatedUser._id,
            fullname: updatedUser.fullname,
            profileImageUrl: updatedUser.profileImageUrl,
          },
          receiver: {
            _id: updatedFriend._id,
            fullname: updatedFriend.fullname,
            profileImageUrl: updatedFriend.profileImageUrl,
          },
        },
      },
    });

    //return user information
    return updatedUser;
  }

  async removeInvite(
    { userId }: TokenPayloadInterface,
    { inviteId }: RemoveInviteDto,
  ) {
    //get feed record from redis
    let inviteRecord: FriendInviteDocument = await this.cacheManager.get(
      `friend_invite:${inviteId}`,
    );

    if (!inviteRecord) {
      inviteRecord = await this.friendInviteRepository.findOne({
        _id: inviteId,
      });

      if (!inviteRecord) {
        throw new NotFoundException('Not Found Resource');
      }
    }

    //check if invite record is exist with userId equal to receiver
    if (inviteRecord.receiver.toString() !== userId.toString()) {
      throw new BadRequestException('Invalid Request');
    }

    //check if invite record is exist with pending status
    if (inviteRecord.status !== 'pending') {
      throw new BadRequestException('Processed Resource');
    }

    //if valid, update status
    //and delete inviteId from sender and receiver
    const [updatedFriendInvite, updatedUser, updatedFriend] = await Promise.all(
      [
        //update status
        this.friendInviteRepository.findOneAndUpdate(
          { _id: inviteId },
          { status: FriendInviteStatus.Rejected },
        ),

        //delete inviteId from sender and receiver
        this.userRepository.findOneAndUpdate(
          { _id: inviteRecord.receiver },
          {
            $pull: { friendInvites: inviteId },
          },
          [
            { path: 'friendList', select: '_id fullname profileImageUrl' },
            {
              path: 'friendInvites',
              select: '_id sender receiver createdAt',
              populate: [
                {
                  path: 'sender',
                  select: '_id fullname profileImageUrl',
                },
                {
                  path: 'receiver',
                  select: '_id fullname profileImageUrl',
                },
              ],
            },
          ],
        ),

        this.userRepository.findOneAndUpdate(
          { _id: inviteRecord.sender },
          {
            $pull: { friendInvites: inviteId },
          },
          [
            { path: 'friendList', select: '_id fullname profileImageUrl' },
            {
              path: 'friendInvites',
              select: '_id sender receiver createdAt',
              populate: [
                {
                  path: 'sender',
                  select: '_id fullname profileImageUrl',
                },
                {
                  path: 'receiver',
                  select: '_id fullname profileImageUrl',
                },
              ],
            },
          ],
        ),
      ],
    );

    //delete sensitive infor
    delete updatedUser.password;
    delete updatedFriend.password;

    //update redis
    await Promise.all([
      this.cacheManager.set(`friend_invite:${inviteId}`, updatedFriendInvite, {
        ttl: createTTL(60 * 60 * 24 * 30, 60 * 60 * 24),
      }),

      this.cacheManager.set(`user:${updatedUser.email}`, updatedUser, {
        ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
      }),

      this.cacheManager.set(`user:${updatedFriend.email}`, updatedFriend, {
        ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
      }),
    ]);

    //emit infor
    this.notificationClient.emit('emit_message', {
      name: 'remove_invite',
      payload: {
        userId: updatedFriend._id.toHexString(),
        metadata: {
          _id: updatedFriendInvite._id,
        },
      },
    });

    //return user infor
    return updatedUser;
  }

  async acceptInvite(
    { userId }: TokenPayloadInterface,
    { inviteId }: RemoveInviteDto,
  ) {
    //  Get invite
    let inviteRecord: FriendInviteDocument = await this.cacheManager.get(
      `friend_invite:${inviteId}`,
    );

    if (!inviteRecord) {
      inviteRecord = await this.friendInviteRepository.findOne({
        _id: inviteId,
      });

      if (!inviteRecord) {
        throw new NotFoundException('Not Found Resource');
      }
    }

    //  Check invite status is pending or not
    if (inviteRecord.status !== FriendInviteStatus.Pending) {
      throw new BadRequestException('Processed Resource');
    }

    //  Check receiver is correct or not
    if (inviteRecord.receiver.toString() !== userId.toString()) {
      throw new BadRequestException('Invalid Request');
    }

    //  Update status invite record
    //  Delete invite id from user and friend record
    //  Add friend into user and friend record
    const [updatedFriendInvite, updatedUser, updatedFriend] = await Promise.all(
      [
        //update status
        this.friendInviteRepository.findOneAndUpdate(
          { _id: inviteId },
          { status: FriendInviteStatus.Accepted },
        ),

        //delete inviteId from sender and receiver
        this.userRepository.findOneAndUpdate(
          { _id: inviteRecord.receiver },
          {
            $pull: { friendInvites: inviteId },
            $push: { friendList: inviteRecord.sender },
          },
          [
            { path: 'friendList', select: '_id fullname profileImageUrl' },
            {
              path: 'friendInvites',
              select: '_id sender receiver createdAt',
              populate: [
                {
                  path: 'sender',
                  select: '_id fullname profileImageUrl',
                },
                {
                  path: 'receiver',
                  select: '_id fullname profileImageUrl',
                },
              ],
            },
          ],
        ),

        this.userRepository.findOneAndUpdate(
          { _id: inviteRecord.sender },
          {
            $pull: { friendInvites: inviteId },
            $push: { friendList: inviteRecord.receiver },
          },
          [
            { path: 'friendList', select: '_id fullname profileImageUrl' },
            {
              path: 'friendInvites',
              select: '_id sender receiver createdAt',
              populate: [
                {
                  path: 'sender',
                  select: '_id fullname profileImageUrl',
                },
                {
                  path: 'receiver',
                  select: '_id fullname profileImageUrl',
                },
              ],
            },
          ],
        ),
      ],
    );

    //delete sensitive infor
    delete updatedUser.password;
    delete updatedFriend.password;

    await Promise.all([
      this.cacheManager.set(`friend_invite:${inviteId}`, updatedFriendInvite, {
        ttl: createTTL(60 * 60 * 24 * 30, 60 * 60 * 24),
      }),

      this.cacheManager.set(`user:${updatedUser.email}`, updatedUser, {
        ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
      }),

      this.cacheManager.set(`user:${updatedFriend.email}`, updatedFriend, {
        ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
      }),
    ]);

    //emit infor
    this.notificationClient.emit('emit_message', {
      name: 'accept_invite',
      payload: {
        userId: updatedFriend._id.toHexString(),
        metadata: {
          friendInviteId: updatedFriendInvite._id,
          friend: {
            _id: updatedUser._id,
            fullname: updatedUser,
            profileImageUrl: updatedUser.profileImageUrl,
          },
        },
      },
    });

    //update friend statistic
    this.statisticClient.emit('be_friend', {});

    //return user infor
    return updatedUser;
  }

  async deleteFriend(
    { userId, email }: TokenPayloadInterface,
    { friendId }: DeleteFriendDto,
  ) {
    //get user record
    let user: UserDocument = await this.cacheManager.get(`user:${email}`);

    if (!user) {
      user = await this.userRepository.findOne({ _id: userId }, [
        { path: 'friendList', select: '_id fullname profileImageUrl' },
        {
          path: 'friendInvites',
          select: '_id sender receiver createdAt',
          populate: [
            {
              path: 'sender',
              select: '_id fullname profileImageUrl',
            },
            {
              path: 'receiver',
              select: '_id fullname profileImageUrl',
            },
          ],
        },
      ]);

      if (!user) {
        throw new NotFoundException('Not Found Resource');
      }
    }

    //check if friendId is existing or not
    const isFriends: boolean = user.friendList.some(
      (f) => f._id.toString() === friendId,
    );

    if (!isFriends) {
      throw new BadRequestException('No Relation Resources');
    }

    //delete friend from user
    //delete user from friend
    const [updatedUser, updatedFriend] = await Promise.all([
      this.userRepository.findOneAndUpdate(
        { _id: userId },
        {
          $pull: { friendList: friendId },
        },
        [
          { path: 'friendList', select: '_id fullname profileImageUrl' },
          {
            path: 'friendInvites',
            select: '_id sender receiver createdAt',
            populate: [
              {
                path: 'sender',
                select: '_id fullname profileImageUrl',
              },
              {
                path: 'receiver',
                select: '_id fullname profileImageUrl',
              },
            ],
          },
        ],
      ),

      this.userRepository.findOneAndUpdate(
        { _id: friendId },
        {
          $pull: { friendList: userId },
        },
        [
          { path: 'friendList', select: '_id fullname profileImageUrl' },
          {
            path: 'friendInvites',
            select: '_id sender receiver createdAt',
            populate: [
              {
                path: 'sender',
                select: '_id fullname profileImageUrl',
              },
              {
                path: 'receiver',
                select: '_id fullname profileImageUrl',
              },
            ],
          },
        ],
      ),
    ]);

    //delete sensitive infor
    delete updatedUser.password;
    delete updatedFriend.password;

    //update record
    await Promise.all([
      this.cacheManager.set(`user:${updatedUser.email}`, updatedUser, {
        ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
      }),

      this.cacheManager.set(`user:${updatedFriend.email}`, updatedFriend, {
        ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
      }),
    ]);

    //emit infor
    this.notificationClient.emit('emit_message', {
      name: 'delete_friend',
      payload: {
        userId: updatedFriend._id.toHexString(),
        metadata: {
          _id: updatedUser._id,
        },
      },
    });

    //update friend statistic
    this.statisticClient.emit('removed_friend', {});

    //return user infor
    return updatedUser;
  }

  async checkEmailToDeleteAccount({ email, userId }: TokenPayloadInterface) {
    const user = await this.userRepository.findOne({ _id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    //create code
    //create a 6-digit validation code
    const code = Math.floor(100000 + Math.random() * 900000);

    //hash code
    const hashedCode = await argon2.hash(code.toString(), {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 4,
      parallelism: 2,
      secret: Buffer.from(this.configService.get('ARGON2_SERCET')),
    });

    //send event to notification service to send code
    //to this email
    this.notificationClient.emit('send_code_to_delete_account', {
      email: email,
      code,
    });

    //save code in redis and ttl is 5p
    this.cacheManager.set(
      `delete_account_code:${email}`,
      { code: hashedCode },
      {
        ttl: createTTL(60 * 5, 0),
      },
    );
  }

  async deleteAccount(
    { userId, email }: TokenPayloadInterface,
    { code }: DeleteAccountDto,
  ) {
    //check code in redis
    const infor: ChangeEmailPayloadInterface = await this.cacheManager.get(
      `delete_account_code:${email}`,
    );

    //if can't get code throw expired code exception
    if (!infor) {
      throw new BadRequestException('Expired Resource');
    }

    //if incorrect throw incorrect exception
    const { code: correctCode } = infor;

    const isCorrectCode = await argon2.verify(
      correctCode.toString(),
      code.toString(),
      {
        secret: Buffer.from(this.configService.get('ARGON2_SERCET')),
      },
    );

    if (!isCorrectCode) {
      throw new BadRequestException('Incorrect Resource');
    }

    //delete code cache
    this.cacheManager.del(`delete_account_code:${email}`);

    //delete user record
    let deletedUser: UserDocument;

    try {
      deletedUser = await this.userRepository.findOneAndDelete(
        { _id: userId },
        [{ path: 'friendList', select: '_id email' }],
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Not Found Resource');
      }

      throw new InternalServerErrorException('Something is wrong');
    }

    //delete image in s3
    const prevImageName: string = deletedUser.profileImageUrl.split('/').pop();

    this.awss3Client.emit('delete_image', {
      imageName: prevImageName,
    });

    //delete user record redis
    this.cacheManager.del(`user:${email}`);

    //delete friendInvites in db
    await this.friendInviteRepository.deleteMany({
      _id: { $in: deletedUser.friendInvites },
    });

    //delete friendInvites in redis
    for (const invite of deletedUser.friendInvites) {
      this.cacheManager.del(`friend_invite:${invite.toString()}`);
    }

    //update friendList, friendInvites of friends
    const updatedFriends: UserDocument[] = await this.userRepository.updateMany(
      { _id: { $in: deletedUser.friendList } },
      {
        $pull: {
          friendList: deletedUser._id,
        },
      },
      [
        { path: 'friendList', select: '_id fullname profileImageUrl' },
        {
          path: 'friendInvites',
          select: '_id sender receiver createdAt',
          populate: [
            {
              path: 'sender',
              select: '_id fullname profileImageUrl',
            },
            {
              path: 'receiver',
              select: '_id fullname profileImageUrl',
            },
          ],
        },
      ],
    );

    //update redis friend records
    console.log(updatedFriends);
    for (const friend of updatedFriends) {
      this.cacheManager.set(`user:${friend.email}`, friend, {
        ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
      });
    }

    //delete users received invite
    const users = await this.userRepository.updateMany(
      {
        friendInvites: { $in: deletedUser.friendInvites },
      },
      {
        $pull: { friendInvites: { $in: deletedUser.friendInvites } },
      },
      [
        { path: 'friendList', select: '_id fullname profileImageUrl' },
        {
          path: 'friendInvites',
          select: '_id sender receiver createdAt',
          populate: [
            {
              path: 'sender',
              select: '_id fullname profileImageUrl',
            },
            {
              path: 'receiver',
              select: '_id fullname profileImageUrl',
            },
          ],
        },
      ],
    );

    //update redis
    for (const user of users) {
      this.cacheManager.set(`user:${user.email}`, user, {
        ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
      });
    }

    //delete feeds and reactions
    this.feedClient.emit('delete_feeds_and_reactions_for_delete_account', {
      userId,
      friendList: deletedUser.friendList.map((f) => f._id),
    });

    //delete messages
    this.messageClient.emit('delete_messages_for_delete_account', {
      userId,
      friendList: deletedUser.friendList.map((f) => f._id),
    });

    //send email
    this.notificationClient.emit('send_email_for_delete_account', {
      email: email,
    });

    //updated user statistic
    this.statisticClient.emit('deleted_user', {});

    //emit friends
    this.notificationClient.emit('emit_message', {
      name: 'delete_user',
      payload: {
        friendList: deletedUser.friendList.map((friend) => friend._id),
      },
    });
  }

  async getUserInforByAdminWithId(userId: Types.ObjectId) {
    console.log(userId);
    //get user infor
    const user = await this.userRepository.findOne(
      {
        _id: userId,
        role: 'normal_user',
      },
      [
        { path: 'friendList', select: '_id fullname profileImageUrl' },
        {
          path: 'friendInvites',
          select: '_id sender receiver createdAt',
          populate: [
            {
              path: 'sender',
              select: '_id fullname profileImageUrl',
            },
            {
              path: 'receiver',
              select: '_id fullname profileImageUrl',
            },
          ],
        },
      ],
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    delete user.password;

    return user;
  }

  async getUserInforByAdminWithEmail(email: string) {
    console.log(email);
    //get user infor
    const user = await this.userRepository.findOne(
      {
        email,
        role: 'normal_user',
      },
      [
        { path: 'friendList', select: '_id fullname profileImageUrl' },
        {
          path: 'friendInvites',
          select: '_id sender receiver createdAt',
          populate: [
            {
              path: 'sender',
              select: '_id fullname profileImageUrl',
            },
            {
              path: 'receiver',
              select: '_id fullname profileImageUrl',
            },
          ],
        },
      ],
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    delete user.password;

    return user;
  }
}
