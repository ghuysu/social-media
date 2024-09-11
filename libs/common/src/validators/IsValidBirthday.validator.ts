import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsValidBirthday', async: false })
export class IsValidBirthdayConstraint implements ValidatorConstraintInterface {
  validate(birthday: string) {
    // Regex để kiểm tra định dạng dd/mm/yyyy
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;

    // Kiểm tra nếu chuỗi birthday khớp với regex
    const match = birthday.match(regex);
    if (!match) {
      return false;
    }

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    // Kiểm tra các giá trị ngày, tháng, năm có hợp lệ không
    if (
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31 ||
      year < 1900 ||
      year >= new Date().getFullYear()
    ) {
      return false;
    }

    // Kiểm tra số ngày trong tháng
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    return 'Birthday must be in the format dd/mm/yyyy and a valid date';
  }
}

export function IsValidBirthday(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidBirthdayConstraint,
    });
  };
}
