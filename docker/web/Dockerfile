FROM alpine:latest

RUN apk add --no-cache nginx

COPY nginx.conf /etc/nginx/http.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
