/*jshint node:true */
module.exports = function( grunt ) {
	"use strict";

	//[[OLDCODE:hyunsook.park by updated]] - Use grunt.file.expand() instead of grunt.file.expandFiles()
	//var entryFiles = grunt.file.expandFiles( "entries/*.xml" );
	var entryFiles = grunt.file.expand( { filter: "isFile" }, "entries/*.xml" );

	// Project configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON( "package.json" ),
		clean: {
			folder: [ "dist" ]
		},
		jshint: {
			grunt: {
				options: {
					jshintrc: ".jshintrc"
				},
				files: {
					src: [ "Gruntfile.js" ]
				}
			}
		},
		xmllint: {
			all: [].concat( entryFiles, "categories.xml", "entries2html.xsl" )
		},
		xmltidy: {
			all: [].concat( entryFiles, "categories.xml" )
		},
		"build-pages": {
			//[[OLDCODE:hyunsook.park by updated]] - Use grunt.file.expand() instead of grunt.file.expandFiles()
			//all: grunt.file.expandFiles( "pages/**" )
			all: grunt.file.expand( { filter: "isFile" }, "pages/**" )
		},
		"build-xml-entries": {
			all: entryFiles
		},
		"build-resources": {
			//[[OLDCODE:hyunsook.park by updated]] - Use grunt.file.expand() instead of grunt.file.expandFiles()
			//all: grunt.file.expandFiles( "resources/**" )
			all: grunt.file.expand( { filter: "isFile" }, "resources/**" )
		},
		wordpress: grunt.util._.extend({
			dir: "dist/wordpress"
		}, grunt.file.readJSON( "config.json" ) ),
		watch: {
			scripts: {
				files: 'entries/*.xml',
				tasks: ['build'],
				options: {
					interrupt: true
				}
			}
		}
	});

	// grunt plugins
	grunt.loadNpmTasks( "grunt-check-modules" );
	grunt.loadNpmTasks( "grunt-contrib-clean" );
	grunt.loadNpmTasks( "grunt-contrib-jshint" );
	grunt.loadNpmTasks( "grunt-contrib-watch" );
	grunt.loadNpmTasks( "grunt-jquery-content" );
	grunt.loadNpmTasks( "grunt-wordpress" );

	grunt.registerTask( "build", [ "build-pages", "build-xml-entries", "build-xml-categories", "build-xml-full", "build-resources" ] );
	grunt.registerTask( "lint", [ "jshint", "xmllint" ] );
	grunt.registerTask( "build-wordpress", [ "check-modules", "clean", "lint", "build" ] );
	grunt.registerTask( "tidy", [ "xmllint", "xmltidy" ] );

	// Default grunt
	grunt.registerTask( "default", [ "build-wordpress" ] );
};