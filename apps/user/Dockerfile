# Giai Đoạn Development
FROM node:alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json tsconfig.json

COPY libs libs
COPY apps/user apps/user

RUN npm install

RUN npm run build

# Giai Đoạn Production
FROM node:alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=development /usr/src/app/dist/ ./dist/

CMD ["node", "dist/apps/user/src/main"]