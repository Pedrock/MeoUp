$("#new-download").click(function() {
	var url = prompt("URL");
	if (url != null) {
		$.post('/api/downloads', {url:url}, function(data, status){
			alert(data);
			refreshDownloads();
		}, "text");
	}
});

$("#youtube-download").click(function() {
	var url = prompt("Video ID/URL");
	if (url != null) {
		$.post('/api/youtube', {url:url}, function(data, status){
			alert(data);
			refreshDownloads();
		}, "text");
	}
});

function deleteDownload(id)
{
	$.post('api/downloads', {delete:id}, function(data, status) {}, "text");
	$('.download[data-id='+id+']').fadeOut(300, function() { $(this).remove(); });
}

function refreshDownloads()
{
	jQuery.get('api/downloads', {list:true}, function(data, status){
		$('#downloads').html(data);
	}, "text");
}

function updateDownloads()
{
	var timestamp = $("#timestamp").text();
	jQuery.post('api/downloads', {update:timestamp}, function(updates, status){
		for (var i = 0; i < updates.length; i++)
		{
			var update = updates[i];
			$("#timestamp").text(update['now']);
			var download = $(".download[data-id='"+update['id']+"']");
			var progress = (Math.floor(update['downloaded'] / update['size'] * 10000) / 100);
			var progress_bar = download.find(".progress-bar");
			progress_bar.css('width',progress+"%").attr('aria-valuenow',progress).text(progress+"%");
			if (update['status'] % 3 == 0) progress_bar.removeClass('active');
			download.attr('data-status',update['status']);
			if (update['share_url'])
			{
				download.find(".download-link").attr('href',update['share_url']);
				var download_url = update['share_url'].replace(/\/+$/,'').replace("//meocloud.pt/link/","//cld.pt/dl/download/")+"?download=true";
				download.find(".download-icon").attr('href',download_url);
			}
		}
	}, "json");
}

setInterval(function(){
	if ($(".download[data-status=1], .download[data-status=2]").length > 0) updateDownloads();
}, 2000);