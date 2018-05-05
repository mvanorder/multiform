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
    }
  };

  grunt.initConfig(config);

  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  grunt.registerTask(
    'release',[
      'concat:dist',
      'babel:dist',
      'uglify:dist',
      'uglify:extras',
      'usebanner:release',
      'compress:main',
      'compress:src',
      'compress:starter_template',
      'compress:parallax_template',
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
    ['concat:temp', 'configureBabel', 'babel:bin', 'clean:temp']
  );
  grunt.registerTask('travis', ['js_compile', 'jasmine']);
};
