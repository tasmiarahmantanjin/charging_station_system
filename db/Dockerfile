FROM postgres:9.6.22-alpine3.14

COPY migrations/*.sql /docker-entrypoint-initdb.d/

RUN chmod a+r /docker-entrypoint-initdb.d/*.sql