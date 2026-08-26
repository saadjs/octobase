FROM ruby:3.2-slim

RUN apt-get update \
  && apt-get install --yes --no-install-recommends build-essential git \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /site

COPY Gemfile Gemfile.lock ./
RUN bundle install

EXPOSE 4000

CMD ["bundle", "exec", "jekyll", "serve", "--source", "/site", "--destination", "/tmp/octobase-docs", "--host", "0.0.0.0", "--port", "4000", "--watch", "--force_polling"]
