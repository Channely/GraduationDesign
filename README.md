Graduation Design of NodeJS
====================

Environment:
+ 1.OS: Windows/Ubuntu/LinuxMint
+ 2.git: Windows->msysgit ; Linux->git
+ 3.Nodejs: 0.10.26 or latest
+ 4.express: 3.4.8 or latest
+ 5.mongodb
+ 6.bower

###Inital & Start MongoDB:
>1,Download:http://www.mongodb.org/downloads
>
>2,Unzip the file to your filesystem,and rename the unzip folder by name "mongodb".
>
>3,Open the dir ~/path/to/mongodb/ by terminal,
>
	and exec
		$ mkdir graduation_design_db
		$ cd bin
		#start mongodb
		$ mongod -dbpath ../graduation_design_db/
		#the code above can connect db to project and let project save data into graduation_design_db
		#how stop mongodb
		#$ sudo service mongodb stop
		#If catch error while start/staop/restart mongodb, this is possible [solutions](http://my.oschina.net/coderman/blog/201555).
		#添加新功能后，都要清空数据库（即删除 /mongodb/graduation_design_db 文件夹里所有文件）

###Get Blog Project:
>Open the your Projects direction,
>
    and exec
        $ git clone https://github.com/Channely/GraduationDesign.git
        $ cd GraduationDesign
        $ npm install
        $ bower install
        $ node app
        #then open localhost:3000 in Chrome.


