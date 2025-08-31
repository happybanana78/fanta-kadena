FROM ubuntu:22.04

ENV TZ=UTC
RUN apt-get update && apt-get install -y tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update && apt-get install -y \
    software-properties-common \
    curl gnupg2 unzip zip nano git wget lsb-release

RUN curl -fsSl https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs

WORKDIR /var/www/app
COPY ./package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
