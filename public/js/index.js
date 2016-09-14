$(function() {
	var active = false;

	$("#new-download").click(function() {
		$('#file-input').val('');
		$('#file-modal').modal();
	});

	$('#file-modal form').submit(function(e) {
		e.preventDefault();
		var url = $('#file-input').val();
		if (url)
			startDownload('/api/downloads', url, $('#file-modal'));
	});

	$("#youtube-download").click(function() {
		$('#youtube-input').val('');
		$('#youtube-modal').modal();
	});

	$('#youtube-modal form').submit(function(e) {
		e.preventDefault();
		var url = $('#youtube-input').val();
		if (url)
			startDownload('/api/youtube', url, $('#youtube-modal'));
	});

	$('#youtube-modal, #file-modal').on('shown.bs.modal', function (e) {
		$(this).find('input[type="text"]').focus();
	});

	$('#youtube-modal, #file-modal').on('show.bs.modal', function (e) {
		$(this).find('.spinner').hide();
		$(this).find('input[type="text"]').val('');
	});

	function startDownload(endpoint, url, modal)
	{
		if (active) return;
		active = true;
		modal.data('bs.modal').isShown = false;
		var spinner = modal.find('.spinner');
		spinner.show();
		var footer = modal.find('.modal-footer');
		footer.children('.btn').addClass('disabled');
		$.post(endpoint, {url:url}, function(data, status, jqXHR){
			refreshDownloads();
			modal.data('bs.modal').isShown = true;
			$('.modal').modal('hide');
		}, "text")
			.fail(function(jqXHR) {
				modal.data('bs.modal').isShown = true;
				footer.append('<div class="alert alert-danger"> \
				<a href="#" class="close" data-dismiss="alert" aria-label="close">×</a> \
				<strong>Error!</strong> Download failed. Please check your URL and try again.</div>');
			}).always(function() {
			spinner.hide();
			footer.children('.btn').removeClass('disabled');
		}).always(function() {
			active = false;
		});
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