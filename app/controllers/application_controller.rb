class ApplicationController < ActionController::Base
  #protect_from_forgery
  layout 'application'

  def render_404(exception = nil)
    if exception
        logger.info "Rendering 404: #{exception.message}"
    end

    render :file => "#{Rails.root}/public/404.html", :status => 404, :layout => false
  end
end
