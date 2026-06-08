#!/bin/bash
set -e

if [ ! -s "$PGDATA/PG_VERSION" ]; then
  echo "Initializing PostgreSQL..."
  mkdir -p "$PGDATA" /run/postgresql
  chown -R postgres:postgres "$PGDATA" /run/postgresql
  su-exec postgres initdb -D "$PGDATA"
  echo "listen_addresses = '*'" >> "$PGDATA/postgresql.conf"
  echo "host all all all scram-sha-256" >> "$PGDATA/pg_hba.conf"
  su-exec postgres pg_ctl -D "$PGDATA" -o "-c listen_addresses='*'" -w start
  su-exec postgres psql -v ON_ERROR_STOP=1 --username postgres <<-EOSQL
    CREATE USER ${POSTGRES_USER} WITH PASSWORD '${POSTGRES_PASSWORD}';
    CREATE DATABASE ${POSTGRES_DB} OWNER ${POSTGRES_USER};
EOSQL
  su-exec postgres pg_ctl -D "$PGDATA" -m fast -w stop
fi

if ! grep -q "listen_addresses = '*'" "$PGDATA/postgresql.conf"; then
  echo "listen_addresses = '*'" >> "$PGDATA/postgresql.conf"
fi

chown -R postgres:postgres "$PGDATA" /run/postgresql
exec su-exec postgres postgres -D "$PGDATA"
