FROM node:22-slim

# Prisma engine cần openssl
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
# Giữ devDependencies vì cần prisma CLI để chạy `prisma migrate deploy`
RUN npm ci

COPY . .
# prisma.config.ts đòi DATABASE_URL tồn tại; generate không kết nối DB nên dùng giá trị giả
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]
