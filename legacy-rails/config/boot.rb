ENV['BUNDLE_GEMFILE'] ||= File.expand_path('../Gemfile', __dir__)

# Fix for Ruby 3.0.2 compatibility with Rails 6.1.7.10
require 'logger'

require "bundler/setup" # Set up gems listed in the Gemfile.
require "bootsnap/setup" # Speed up boot time by caching expensive operations.
