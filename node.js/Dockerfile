# Set the base image to Ubuntu
FROM ubuntu:latest

# Install Node.js and other dependencies
RUN apt-get update && apt-get -y dist-upgrade && \
    apt-get -y install curl sudo gnupg2 && \
    curl -sL https://deb.nodesource.com/setup_19.x | sudo bash - && \
    apt-get -y install python3 build-essential nodejs gcc g++ make

# Install tsc-watch
RUN npm install -g tsc-watch

# Provides cached layer for node_modules
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /src && cp -a /tmp/node_modules /src/

# Define working directory
WORKDIR /src
ADD . /src

# Expose port
EXPOSE  8080

# Run app using tsc-watch
CMD ["tsc-watch", "--onSuccess", "node dist/app.js"]
