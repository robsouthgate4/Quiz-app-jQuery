
var quizApp = {

    init: function( settings ) {

        quizApp.config = {
            container: $('.carousel'),
            urlBase: 'data.json',
            items: function() {
                return $('.item');
            },
            startQuizBtn: $('#startQuiz')
        };

        // Allow overriding the default config
        $.extend( quizApp.config, settings );

        this.answerObj = {};
    	this.questions = [];
        this.questionsArray = [];
        this.feedbackArray = [];
        
        quizApp.loadQuestions();        

        quizApp.config.startQuizBtn.on('click', function(){
        	$('.start-slide').fadeOut(400);
		});

    },

    loadQuestions: function() {
    	$.getJSON(quizApp.config.urlBase, function(data) {			
			quizApp.questions = data.questionset;
            quizApp.feedbackArray = data.feedbackItems;
			quizApp.buildQuestions();
    	});
    },

    buildQuestions: function() {
        /*  Build our questions based on data */
    	var questions = quizApp.questions;
        quizApp.buildIndicators(questions);
    	
    	for ( var i = 0; i < questions.length; i++ ) {

    		var contentString = '';

    		contentString += '<div class="item" id="' + i + '">';
    		contentString += '<h2>' + questions[i].title + '</h2>';
    		contentString += '<p>' + questions[i].question  + '</p>';
    		contentString += '<ul>';
    		contentString += '<li data-option-id="5"> A: ' + questions[i].optionOne + '</li>';
    		contentString += '<li data-option-id="10"> B: ' + questions[i].optionTwo + '</li>';
    		contentString += '<li data-option-id="15"> C: ' + questions[i].optionThree + '</li>';
    		contentString += '<li data-option-id="20"> D:  ' + questions[i].optionFour + '</li>';
    		contentString += '</ul>';
    		contentString += '</div>';

    		quizApp.config.container.find('.carousel-inner').append(contentString);
    	}

        quizApp.config.items().first().addClass('active');
        quizApp.insertResultSlide();

        quizApp.config.container.carousel({
            interval: false
        });

        quizApp.answerSelect();
        quizApp.config.container.on('slid.bs.carousel', quizApp.answerSelect);
        quizApp.nextSlide();
    },

    insertResultSlide: function() {
        quizApp.config.container.find('.carousel-inner').append('<div class="item"></div>');     
    },

    buildIndicators: function(questions) {

        /* Build our indicators based on number of questions */
        var indicatorMarkup = '';
        indicatorMarkup += '<ol class="carousel-indicators">';

        for ( var i = 0; i < questions.length + 1; i ++ ) { // Add extra indicator for result slide
            indicatorMarkup += '<li data-target="#carousel-example-generic">';
        }

        indicatorMarkup += '</ol>';
        quizApp.config.container.append(indicatorMarkup);
        $('.carousel-indicators li:first').addClass('active');

    },

    nextSlide: function() {

        // Disabel slide to next
        quizApp.config.container.find('.right').hide();              
        quizApp.config.container.find('.right').on('click', function(){

            $(this).fadeOut(300);

            var answer = $('.item.active').find('.selected').data('option-id');   
            quizApp.buildAnswerObject(answer);

        });        

    },

    answerSelect: function() {

        var answer = null;

        $('.item.active').find('li').on('click', function(){

            $(this).siblings('li').removeClass('selected');
            $(this).addClass('selected');            
            quizApp.config.container.find('.right').fadeIn(300);                     

        });
        
    },

    buildAnswerObject: function(answer) {

        quizApp.answerObj = { "answer" : answer };
        quizApp.questionsArray.push(quizApp.answerObj);
        var finalArray = quizApp.questionsArray;

        if (quizApp.questionsArray.length == quizApp.questions.length) {
            quizApp.reviewAnswers(finalArray);
        }        

    },

    reviewAnswers: function(finalArray) {

        var points = 0;

        for ( var i = 0; i < finalArray.length; i++ ) {

            // Temporary array to allow us to add our answer values
            var valueArray = [];
            valueArray.push(finalArray[i].answer);            

            // Add each answer value
            $.each(valueArray, function(){
                points += this;
            });

        }

        var result = null;

        if ( points >= 20 && points <= 40 ) {
            result = 0;
        } else if ( points >= 41 && points <= 60 ) {
            result = 1;
        } else {
            result = 2;
        }        

        quizApp.populateResultSlide(result);
        
    },

    populateResultSlide: function(result) {

        var item = result;

        var contentString = '';
        contentString += '<h2>' + quizApp.feedbackArray[item].resultTitle + '</h2>'; 
        contentString += '<h2>' + quizApp.feedbackArray[item].resultBody + '</h2>'; 
        quizApp.config.container.find('.item').last().append(contentString)
            .append('<button class="restart">Restart</button>');

        $('.restart').on('click', quizApp.restartQuiz);

    },

    restartQuiz: function() {
        quizApp.answerObj = {};
        quizApp.questionsArray = [];
        quizApp.config.items().find('li').removeClass('selected');    
        quizApp.config.container.carousel(0);        
        quizApp.config.container.find('.item').last().html('');
    }

}