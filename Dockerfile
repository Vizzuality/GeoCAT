# syntax=docker/dockerfile:1
FROM ruby:2.6.10

RUN apt update -qq && apt install -y build-essential postgresql-client libpq-dev

WORKDIR /app

COPY Gemfile Gemfile.lock ./
RUN gem install bundler -v 2.0.0
RUN bundle install

COPY . ./

EXPOSE 3000

# Configure the main process to run when running the image
ENTRYPOINT ["./entrypoint.sh"]