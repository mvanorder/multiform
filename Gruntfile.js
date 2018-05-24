module.exports = function(grunt) {

  var concatFile = 'temp/js/multiform_concat.js.map';

  var config = {
    //  Jasmine
    jasmine: {
      components: {
        src: [
          'bin/multiform.js'
        ],
        options: {
          vendor: [
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/jasmine-jquery/lib/jasmine-jquery.js'
          ],
          specs: 'tests/spec/**/*Spec.js',
          helpers: 'tests/spec/helper.js',
          keepRunner: true
        }
      }
    },

    babel: {
		  options: {
			  sourceMap: false,
			  plugins: [
        ],
        presets: [
          ["env", {
            "targets": {
              "chrome": "45"
            }
          }]
        ]
		  },
		  bin: {
        options: {
          sourceMap: true
        },
			  files: {
				  'bin/multiform.js': 'temp/js/multiform_concat.js'
			  }
		  },
      dist: {
        files: {
          'dist/js/multiform.js': 'temp/js/multiform.js'
        }
      }
	  },

    //  Clean
    clean: {
      temp: {
        src: [ 'temp/' ]
      },
    },

    //  Compress
    compress: {
      main: {
        options: {
          archive: 'bin/multiform.zip',
          level: 6
        },
        files:[
          {expand: true, cwd: 'dist/', src: ['**/*'], dest: 'multiform/'},
          {
            expand: true,
            cwd: './',
            src: ['LICENSE', 'README.md'],
            dest: 'multiform/'
          },
        ]
      },

      src: {
        options: {
          archive: 'bin/multiform-src.zip',
          level: 6
        },
        files:[
          {
            expand: true,
            cwd: 'js/',
            src: ["multiform.js"],
            dest: 'multiform-src/js/'
          },
          {
            expand: true,
            cwd: 'dist/js/',
            src: ['**/*'],
            dest: 'multiform-src/js/bin/'
          },
          {
            expand: true,
            cwd: './',
            src: ['LICENSE', 'README.md'],
            dest: 'multiform-src/'
          }
        ]
      },
    },

    //  Copy
    copy: {
      main: {
        files: [
          // includes files within path and its sub-directories
          {expand: true, src: ['demos/**'], dest: 'dist/'},
        ],
      },
    },

    //  Concat
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        // the files to concatenate
        src: [
          "js/polyfill.js",
          "js/multiform.js",
        ],
        // the location of the resulting JS file
        dest: 'temp/js/multiform.js'
      },
      temp: {
        // the files to concatenate
        options: {
          sourceMap: true,
          sourceMapStyle: 'link'
        },
        src: [
          "js/polyfill.js",
          "js/multiform.js",
        ],
        // the location of the resulting JS file
        dest: 'temp/js/multiform_concat.js'
      },
    },

    // Rename files
    rename: {
      rename_src: {
        src: 'bin/multiform-src'+'.zip',
        dest: 'bin/multiform-src-v'+grunt.option( "newver" )+'.zip',
        options: {
          ignore: true
        }
      },
      rename_compiled: {
        src: 'bin/multiform'+'.zip',
        dest: 'bin/multiform-v'+grunt.option( "newver" )+'.zip',
        options: {
          ignore: true
        }
      },
    },

    // Text Replace
    replace: {
      version: { // Does not edit README.md
        src: [
          //'bower.json',
          'package.json',
          //'package.js',
          //'jade/**/*.html'
        ],
        overwrite: true,
        replacements: [{
          from: grunt.option( "oldver" ),
          to: grunt.option( "newver" )
        }]
      },
      readme: { // Changes README.md
        src: [
          'README.md'
        ],
        overwrite: true,
        replacements: [{
          from: 'Current Version : v'+grunt.option( "oldver" ),
          to: 'Current Version : v'+grunt.option( "newver" )
        }]
      },
    },

    //  Uglify
    uglify: {
      options: {
        // Use these options when debugging
        // mangle: false,
        // compress: false,
        // beautify: true
      },
      dist: {
        files: {
          'dist/js/multiform.min.js': ['dist/js/multiform.js']
        }
      },
      bin: {
        files: {
          'bin/multiform.min.js': ['bin/multiform.js']
        }
      },
      dev: {
        files: {
          'js/multiform.min.js': ['bin/multiform.js']
        }
      }
    },

    // Create Version Header for files
    usebanner: {
      release: {
        options: {
          position: 'top',
          banner: "/*!\n * MultiForm v"+ grunt.option( "newver" ) +" (https://github.com/mvanorder/multiform)\n * Copyright 2018 Malcolm VanOrder\n * MIT License (https://raw.githubusercontent.com/mvanorder/multiform/master/LICENSE)\n */",
          linebreak: true
        },
        files: {
          src: [ 'dist/css/*.css', 'dist/js/*.js']
        }
      }
    }
  };

  grunt.initConfig(config);

  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-banner');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-rename-util');
  grunt.loadNpmTasks('grunt-text-replace');

  grunt.registerTask(
    'release',[
      'concat:dist',
      'babel:dist',
      'uglify:dist',
      'usebanner:release',
      'copy:main',
      'compress:main',
      'compress:src',
      'replace:version',
      'replace:readme',
      'rename:rename_src',
      'rename:rename_compiled',
      'clean:temp'
    ]
  );

  grunt.task.registerTask(
    "configureBabel",
    "configures babel options",
    function() {
      config.babel.bin.options.inputSourceMap = grunt.file.readJSON(concatFile);
    }
  );

  grunt.registerTask(
    'js_compile',
    ['concat:temp', 'configureBabel', 'babel:bin', 'clean:temp', 'uglify:dev',]
  );
  grunt.registerTask('travis', ['js_compile', 'jasmine']);
};
