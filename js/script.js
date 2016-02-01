/**
* Лайки
*/
var getLikeText = function(n)
{
	var text;
	if(n == 1) text = "лайк";
	if(n >= 2 && n <=4 ) text = "лайка";
	if(n == 0 || n >= 5) text = "лайков";
	return n + " " + text;
};


/**
* Отображение ошибок
*/
var showErrorMessage = function(id, error)
{
	var text = error['error_msg'];
	if(text == 'Access denied: user deactivated')
		text = 'Этот пользователь удалил свою анкету.';
	$(id).html('<div class="col-xs-12"><br />' + text + '</div>');
};


/**
* Парсинг GET параметров
*/
var parseQueryString = function(strQuery)
{
	var strSearch   = strQuery.substr(1),
		strPattern  = /([^=]+)=([^&]+)&?/ig,
		arrMatch    = strPattern.exec(strSearch),
		objRes      = {};
	while(arrMatch != null)
	{
		objRes[arrMatch[1]] = arrMatch[2];
		arrMatch = strPattern.exec(strSearch);
	}
	return objRes;
};


/**
* Печать массива
*/
var print_r = function(arr, level)
{
	var print_red_text = "";
	if(!level) level = 0;
	var level_padding = "";
	for(var j=0; j<level+1; j++) level_padding += "    ";
	if(typeof(arr) == 'object')
	{
		for(var item in arr)
		{
			var value = arr[item];
			if(typeof(value) == 'object')
			{
				print_red_text += level_padding + "'" + item + "' :\n";
				print_red_text += print_r(value,level+1);
			} 
			else 
				print_red_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
		}
	} 
	else  print_red_text = "===>"+arr+"<===("+typeof(arr)+")";
	return print_red_text;
}


/**
* Сортировка по параметру
*/
var like = function(i, ii)
{
	if(i.likes.count < ii.likes.count) return 1;
	else if(i.likes.count > ii.likes.count) return -1;
	else return 0;
}


/**
* Формирование HTML для вывода фотографий
*/
var getPhotoTop = function(items)
{
	var c = '<br />', nmax = 12;
	if(items.length < nmax) nmax = items.length;
	for(var n = 0; n < nmax; n++)
	{
		c = c + '<div class="col-xs-3">';
		c = c + '<a class="thumbnail" href="http://vk.com/photo' + items[n].owner_id + '_' + items[n].id + '" target="_blank" style="border:none; background:url(' + items[n].photo_604 + ') center center no-repeat; background-size: cover;"></a>';
		c = c + '<span class="subtext">' + getLikeText(items[n].likes.count) + '</span>';
		c = c + '</div>';
	}
	if(items.length == 0)
		c = '<div class="col-xs-3"><br />Фотографий нет.</div>';
	return c;
}


/**
* Вывод фотографий
*/
var showPhotoTop = function(top_id, viewer_id)
{
	var method = 'photos.get', param =	{album_id: top_id, owner_id: viewer_id, extended: '1'};
	if(top_id == 'albums')
	{
		method = 'photos.getAll';
		param = {owner_id: viewer_id, extended: '1', offset: '0', count: '200', no_service_albums: '1'};
	}
	VK.api(method, param, function(data)
	{
		if(data.response)
		{
			data.response.items.sort(like);
			$('#' + top_id).html(getPhotoTop(data.response.items));
		}
		else
			showErrorMessage('#' + top_id, data.error);
	});
}


/**
* Основная функция
*/
$(document).ready(function()
{
	var queryStr = parseQueryString(window.location.search), viewer_id = queryStr['viewer_id'];

	VK.init(function()
	{ 
		//select profile
		$('#myTab a').click(function(e)
		{
			e.preventDefault();
			$(this).tab('show');
		});

		VK.api('friends.get', {user_id: viewer_id, fields: 'nickname', order: 'name'}, function(data)
		{
			if(data.response)
			{
				$('#select_profile')
					.append($("<option></option>")
					.attr("value", viewer_id)
					.text("Мой профиль"));
				for(var i = 0; i < data.response.count; i++)
				{
					$('#select_profile')
						.append($("<option></option>")
						.attr("value", data.response.items[i].id)
						.text(data.response.items[i].first_name + " " + data.response.items[i].last_name));
				}
			}
			else
				alert(data.error['error_msg']);
		});
		
		$('#select_profile').change(function() {
			var top_id = 'profile';
			viewer_id = this.value;
			jQuery.each($('.nav li a'), function(i, e)
			{
				if($(e).parent().attr('class') == 'active')
					top_id = e.id.replace('_tab', '');
			});	
			showPhotoTop(top_id, viewer_id);
		});

		$('.nav li a').click(function() {
			var top_id = this.id.replace('_tab', '');
			$('.tab-pane').html('<img src="img/load.gif" />');
			showPhotoTop(top_id, $('#select_profile').val());
		});

		showPhotoTop('profile', viewer_id);
		
	}, function()
	{ 
		// API initialization failed 
		// Can reload page here 
	}, '5.44');
});