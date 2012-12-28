define(function()
{
	var OLIST={};
	return function (id)
	{
		if( id==='!clear-cache')
		{
			OLIST={};
			return ;
		}
		if( !OLIST[id])
			OLIST[id] = document.getElementById(id);
		return OLIST[id];
	}
});
