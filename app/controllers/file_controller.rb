class FileController < ApplicationController

  
  def download
    
    json = JSON.parse(params[:rla])
    
    file_name = filename_escape(json["scientificname"])
    headers["Content-Type"] = "text/rlat"
    headers["Content-Disposition"] = "attachment; filename=\"#{file_name}.rlat\"";
    render :text => params[:rla]
  end
  
  def upload
    if params[:file]
      begin
        uploaded_file = params[:file]
        file_content=uploaded_file.read
        rla = JSON.parse(file_content)
    
        #TODO: Validate the file to check if there is an error on the content of the file
        #if it fails redirect
      
        @rla_json = file_content
      rescue Exception=>e
        #something went wrong while parsing uploaded file.REDIRECT!!
        @rla_json = ""
      end
    else 
      @rla_json = ""
    end
    render :template => 'rlas/editor'
  end
  
  
end




def filename_escape(string)
  string.gsub(/([^ a-zA-Z0-9_.-]+)/n) do
    '%' + $1.unpack('H2' * $1.size).join('%').upcase
  end.tr(' ', '_')
end