define(['core/controller'],function (Fcontroller)
{
	var control_config={
		up:'up', down:'down', left:'left', right:'right'
	};
	var control = new Fcontroller(control_config);
	return control;
});
