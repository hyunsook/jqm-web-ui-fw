module.exports = function( grunt ) {
	"use strict";

	var _ = grunt.util._,
		path = require( "path" ),
		dist = "dist",
		httpPort =  Math.floor( 9000 + Math.random()*1000 );

	// grunt plugins
	grunt.loadNpmTasks( "grunt-contrib-connect" );
	grunt.loadNpmTasks( "grunt-contrib-requirejs" );
	grunt.loadNpmTasks( "grunt-contrib-jshint" );
	grunt.loadNpmTasks( "grunt-contrib-qunit" );
	grunt.loadNpmTasks( "grunt-qunit-junit" );

	// load the project's default tasks
	grunt.loadTasks( "build/tasks" );

	// Project configuration
	grunt.config.init( {
		pkg: grunt.file.readJSON( "package.json" ),

		version: "<%= pkg.version %>",

		jshint: {
			js: {
				options: {
					jshintrc: "js/.jshintrc"
				},
				files: {
					src: [
						"js/**/*.js",
						"!js/jquery.hashchange.js",
						"!js/jquery.js",
						"!js/jquery.ui.widget.js"
					]
				}
			},
			grunt: {
				options: {
					jshintrc: ".jshintrc"
				},
				files: {
					src: [ "Gruntfile.js" ]
				}
			}
		},

		requirejs: {
			js: {
				options: {
					baseUrl: "js",
					paths: {
						"depend": "../jqm/external/requirejs/plugins/depend",
						"text": "../jqm/external/requirejs/plugins/text",
						"json": "../jqm/external/requirejs/plugins/json",
						"jqm": "../jqm/js",
						"jq-color": "../jq-color"
					},
					//Finds require() dependencies inside a require() or define call.
					findNestedDependencies: true,
					optimize: "none",

					//If skipModuleInsertion is false, then files that do not use define()
					//to define modules will get a define() placeholder inserted for them.
					//Also, require.pause/resume calls will be inserted.
					//Set it to true to avoid this. This is useful if you are building code that
					//does not use require() in the built project or in the JS files, but you
					//still want to use the optimization tool from RequireJS to concatenate modules
					//together.
					skipModuleInsertion: true,

					include: ( grunt.option( "modules" ) || "web-ui-fw" ).split( "," ),

					exclude: [
						"jquery",
						"jqm/jquery",
						"depend",
						"json!package.json"
					],

					out: path.join( dist, "web-ui-fw.js" ),

					pragmasOnSave: {
						jqmBuildExclude: true
					},

					onBuildWrite: function( moduleName, path, contents ) {
						return contents.replace( /__version__/g, grunt.config.process( "\"<%= version %>\"" ) );
					}
				}
			}
		},

		connect: {
			server: {
				options: {
					port: httpPort,
					base: "."
				}
			}
		},

		qunit_junit: {
			options: {
				dest: "build/test-results",
				namer: function (url) {
					var match = url.match(/tests\/([^\/]*)\/(.*)$/);
					return match[2].replace(/\//g, ".").replace(/\.html/, "" ).replace(/\?/, "-");
				}
			}
		},

		qunit: {
			options: {
				timeout: 30000
			},

			files: {},

			http: {
				options: {
					urls: (function() {
						// Find the test files
						var suites = _.without( ( grunt.option( "suites" ) || "" ).split( "," ), "" ),
							patterns, paths,
							prefixes = ["tests/unit/"],
							versionedPaths = [],
							jQueries = _.without( ( grunt.option( "jqueries" ) || process.env.JQUERIES || "" ).split( "," ), "" );

						patterns = [];

						if ( suites.length ) {
							suites.forEach( function( unit ) {
								prefixes.forEach( function( prefix ) {
									patterns = patterns.concat([
										prefix + unit + "/",
										prefix + unit + "/index.html",
										prefix + unit + "/*/index.html",
										prefix + unit + "/**/*-tests.html"
									]);
								});
							});
						} else {
							prefixes.forEach( function( prefix ) {
								patterns = patterns.concat([
									prefix + "*/index.html",
									prefix + "*/*/index.html",
									prefix + "**/*-tests.html"
								]);
							});
						}

						paths = grunt.file.expand( patterns )
							.sort()
							.map( function( path ) {
								// Some of our tests (ie. navigation) don't like having the index.html too much
								return path.replace( /\/\index.html$/, "/" );
							});

						paths = grunt.util._.uniq( paths );

						if ( jQueries.length ) {
							paths.forEach( function( path ) {
								versionedPaths = versionedPaths.concat( jQueries.map( function( jQVersion ) {
									return path + "?jquery=" + jQVersion;
								}) );
							});
						}

						if ( versionedPaths.length ) {
							paths = versionedPaths;
						}

						return paths.map( function( path ) {
							return "http://localhost:<%= connect.server.options.port %>/" + path;
						});
					}())
				}
			}
		}
	});

	grunt.registerTask( "lint", [ "jshint" ] );
	grunt.registerTask( "test", [ "jshint", "js:release", "connect", "qunit:http" ] );
	grunt.registerTask( "js:release",  [ "requirejs"/*, "concat:js", "uglify", "copy:sourcemap"*/ ] );
	grunt.registerTask( "js", [ "config:dev", "js:release" ] );
	grunt.registerTask( "default", [ "lint", "js:release" ] );

};
