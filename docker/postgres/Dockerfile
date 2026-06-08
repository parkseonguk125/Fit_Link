FROM alpine:latest

RUN apk add --no-cache postgresql16 postgresql16-contrib su-exec bash

ENV PGDATA=/var/lib/postgresql/data
ENV POSTGRES_USER=exercise
ENV POSTGRES_PASSWORD=exercise
ENV POSTGRES_DB=exercise_log

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
  && mkdir -p /var/lib/postgresql/data /run/postgresql \
  && chown -R postgres:postgres /var/lib/postgresql /run/postgresql

EXPOSE 5432
ENTRYPOINT ["docker-entrypoint.sh"]
