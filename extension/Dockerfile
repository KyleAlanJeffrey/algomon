FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Default: production build. Override with `command: npm run watch` for dev.
CMD ["npm", "run", "build"]
