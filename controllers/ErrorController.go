package controllers

type ErrorController struct {
	BaseController
}

func (c *ErrorController) Error404() {
	c.Data["content"] = "page not found"
	c.TplName = "tip/404.html"
}

func (c *ErrorController) Error501() {
	c.Data["content"] = "server error"
	c.TplName = "tip/501.html"
}


func (c *ErrorController) ErrorDb() {
	c.Data["content"] = "database is now down"
	c.TplName = "tip/dberror.html"
}
