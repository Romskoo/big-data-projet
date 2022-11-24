FROM node:14

WORKDIR /app

COPY . .

RUN npm install --save-dev --no-eslintrc

RUN npm install react-scripts -g

ARG REACT_APP_API_PORT


ENV REACT_APP_API_PORT $REACT_APP_API_PORT

EXPOSE 3000
