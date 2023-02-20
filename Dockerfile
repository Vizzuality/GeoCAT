# syntax=docker/dockerfile:1
FROM ruby:2.7.7

RUN apt update -qq && apt install -y build-essential postgresql-client libpq-dev

WORKDIR /app

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . ./

EXPOSE 3000