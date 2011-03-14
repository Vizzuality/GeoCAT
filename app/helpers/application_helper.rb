module ApplicationHelper
  
  def headjs_include_tag(*sources)
     keys = []
     coder = HTMLEntities.new
     content_tag :script, { :type => Mime::JS }, false do
       "head.js( #{javascript_include_tag(*sources).scan(/src="([^"]+)"/).flatten.map { |src|
         src = coder.decode(src)
         key = URI.parse(src).path[%r{[^/]+\z}].gsub(/\.js$/,'').gsub(/\.min$/,'')
         while keys.include?(key) do
           key += '_' + key
         end
         keys << key
         "{ '#{key}': '#{src}' }"
       }.join(', ')} );".html_safe
     end
   end
  
end
