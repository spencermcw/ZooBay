FROM postgres:latest
ENV POSTGRES_PASSWORD=password

RUN echo "CREATE ROLE zoo_bay_user WITH LOGIN PASSWORD 'password';" > /docker-entrypoint-initdb.d/001.sql
RUN echo "CREATE DATABASE zoo_bay OWNER zoo_bay_user;" > /docker-entrypoint-initdb.d/002.sql
# RUN echo "CREATE DOMAIN uint_256 AS NUMERIC NOT NULL CHECK (VALUE >= 0 AND VALUE < 2^256) CHECK (SCALE(VALUE) = 0);" > /docker-entrypoint-initdb.d/003.sql

# TODO: Need to seed database here
