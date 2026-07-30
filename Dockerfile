FROM node:24-bookworm AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build

COPY . .
RUN npm run db:generate
RUN npm run build

FROM node:24-bookworm AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist
COPY prisma ./prisma
COPY scripts/container-start.sh ./scripts/container-start.sh

RUN sed -i 's/\r$//' ./scripts/container-start.sh \
  && chmod +x ./scripts/container-start.sh

EXPOSE 3000

ENTRYPOINT ["./scripts/container-start.sh"]
