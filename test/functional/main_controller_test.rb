require 'test_helper'

class MainControllerTest < ActionController::TestCase
  setup do
    @request.user_agent = "Firefox"
  end

  test "should get index" do
    get :index
    assert_response :success
  end

  test "should get about" do
    get :about
    assert_response :success
  end

  test "should get help" do
    get :help
    assert_response :success
  end

  test "should get what" do
    get :what
    assert_response :success
  end
end
