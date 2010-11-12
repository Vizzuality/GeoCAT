class ApplicationController < ActionController::Base
  class NoHTML5Compliant < Exception; end;

  rescue_from Exception, :with => :render_500
  rescue_from NoHTML5Compliant, :with => :no_html5_compliant

  before_filter :browser_is_html5_compliant?

  #protect_from_forgery
  layout 'application'

  def render_404(exception = nil)
    if exception
      logger.info "Rendering 404: #{exception.message}"
      logger.info "Backtrace: #{exception.backtrace}"
    end

    render :file => "#{Rails.root}/public/404.html", :status => 404, :layout => false
  end

  def render_500(exception = nil)
    if exception
      logger.info "Rendering 500: #{exception.message}"
      logger.info 'Backtrace:'
      logger.info exception.backtrace.join("\n")
    end

    render :file => "#{Rails.root}/public/500.html", :status => 500, :layout => false
  end

  def no_html5_compliant
    render :file => "#{Rails.root}/public/HTML5.html", :status => 500, :layout => false
  end

  private
    def browser_is_html5_compliant?
      user_agent = request.user_agent.downcase
      unless user_agent.blank? || user_agent.match(/firefox\/3\.6|safari\/5|chrome\/7|opera\/10/)
        raise NoHTML5Compliant
      end
    end
end
