FROM node:12.18.0-alpine AS builder

WORKDIR /app

COPY . .
ARG buildVersion
ARG timestamp
RUN npm install && \
  npm rebuild node-sass && \
  npm run buildVersion -- --timestamp=$timestamp --buildVersion=$buildVersion && \
  npm run build

FROM nginx:alpine
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist/ /usr/share/nginx/html/


# Copy the EntryPoint
COPY ./entryPoint.sh /
RUN chmod +x entryPoint.sh

ENTRYPOINT ["sh","/entryPoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
