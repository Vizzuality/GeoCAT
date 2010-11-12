class ApplicationController < ActionController::Base
  rescue_from Exception, :with => :render_500

  #protect_from_forgery
  layout 'application'

  def render_404(exception = nil)
    if exception
      logger.info "Rendering 404: #{exception.message}"
    end

    render :file => "#{Rails.root}/public/404.html", :status => 404, :layout => false
  end

  def render_500(exception = nil)
    if exception
     logger.info "Rendering 500: #{exception.message}"
    end

    render :file => "#{Rails.root}/public/500.html", :status => 500, :layout => false
  end
end
