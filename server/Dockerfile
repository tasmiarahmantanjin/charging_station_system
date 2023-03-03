FROM node:16.3.0

WORKDIR /server
RUN chmod 777 /server

# copy json files inside container
COPY package*.json ./

RUN apt-get -y update
RUN apt-get -y upgrade

# Install Dependencies
RUN npm install

# Copy server source code
COPY . .

# ENV PORT
ENV PORT 8000

# Expose port
EXPOSE 8000

# Run server

CMD ["npm", "run", "start"]