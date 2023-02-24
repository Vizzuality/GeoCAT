require 'test_helper'

class GeocatControllerTest < ActionController::TestCase
  setup do
    @request.user_agent = "Firefox"
    @geocat = geocat(:one)
  end

  test "should show geocat" do
    get :show, :id => @geocat.to_param
    assert_response :success
  end
end
