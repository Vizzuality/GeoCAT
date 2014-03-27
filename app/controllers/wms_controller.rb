require 'uri'
require 'json'
require_relative '../helpers/proxy'

class WmsController < ApplicationController

  def proxy
    proxy = Proxy.new(params.fetch(:url))
    render_jsonp(proxy.serialize)
  rescue URI::InvalidURIError => exception
    render_jsonp({ errors: "Couldn't load URL" }, 400)
  end
end

