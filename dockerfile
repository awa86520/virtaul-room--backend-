FROM node:20.12.0-alpine3.19

WORKDIR /app

COPY package.json package-lock.json 



# Install dependencies
RUN npm install
COPY . .



CMD ["npm", "run", "dev"]