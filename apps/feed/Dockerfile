# Giai Đoạn Development
FROM node:alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json tsconfig.json

RUN npm install

COPY libs libs
COPY apps/feed apps/feed

RUN npm run build

# Giai Đoạn Production
FROM node:alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=development /usr/src/app/dist/ ./dist/

CMD ["node", "dist/apps/feed/src/main"]