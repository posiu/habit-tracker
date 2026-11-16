FROM ruby:3.0.2-slim

RUN apt-get update -qq && apt-get install -y --no-install-recommends \
    build-essential libpq-dev nodejs npm git curl && \
    npm install -g yarn && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV RAILS_ENV=production RAILS_LOG_TO_STDOUT=true RAILS_SERVE_STATIC_FILES=true BUNDLE_WITHOUT=development:test

COPY Gemfile Gemfile.lock ./
RUN bundle install --jobs 4

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN SECRET_KEY_BASE=precompile bundle exec rails assets:precompile

EXPOSE 3000
HEALTHCHECK CMD curl -f http://localhost:3000/up || exit 1
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
