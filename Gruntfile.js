module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        transport: {
            dialog: {
                files : [
                    {
                        src : '*',
                        dest : '.build/styles/component/dialog/src'
                    }
                ]
            }
        },
        concat: {
            dialog: {
                files: {
                    "dist/styles/component/dialog/src/dialog.js": [".build/styles/component/dialog/src/dialog.js"]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-cmd-transport');
    grunt.loadNpmTasks('grunt-cmd-concat');

    grunt.registerTask('build', ['transport', 'concat']);
};
