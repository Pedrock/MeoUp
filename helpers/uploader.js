var Downloads = rootRequire('models/downloads');

var clean_name = function(url)
{
	return url.replace(/ /g,'-').replace(/[^A-Za-z0-9-_.]|[.](?=.*[.])/g,'');
};

var uploadFromUrl = function(api, stream, filename, user_id, url) {
	filename = clean_name(filename);
	stream.pipe(api.getUploadPipe(filename));
	
	Downloads.create(user_id, url, filename, function(download_id) {
		stream.on('progress', function (state) {
			console.log('progress', state.percentage);
			Downloads.updateProgress(user_id, download_id, state.size.transferred, state.size.total);
		})
			.on('error', function (err) {
				console.log('error', err);
				Downloads.setError(user_id, download_id);
			})
			.on('end', function () {
				console.log('progress', 'Finished');
				setTimeout(function()
				{
					api.share(filename, function(body) {
						if (body) {
							var share_url = JSON.parse(body).url;
							Downloads.setFinished(user_id, download_id, share_url);
						}
						else
							Downloads.setFinished(user_id, download_id, null);
					});
				}, 1000);
			});
	});
};

module.exports.uploadFromUrl = uploadFromUrl;