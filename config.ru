# This file is used by Rack-based servers to start the application.

require ::File.expand_path('../config/environment',  __FILE__)

if "development" ==  Rails.env
  module Rack
    class XSendfile
      def initialize app
        @app = app
      end
      
      def call env
        status, headers, body = @app.call env
        if headers["X-Sendfile"]
          file = headers.delete("X-Sendfile") 
          body = ::File.read(file) 
        end
        [status, headers, body]
      end
    end
  end
  use Rack::XSendfile	     
end

run Rlat::Application
