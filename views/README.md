# Swig 用法

```html
{% extends 'layouts/general.html' %}
{% block title %}{{ title }}{% endblock %}

{% block head %}
{% parent %}
<link type=stylesheet herf="foot.css">
<script src="bootstrap.min.js"><script>
{% endblock %}

{% block header %}
{% parent %}
...
{% endblock %}


```

```js
app.get('/', function (req, res) {
  res.render('index', { 
    /* template locals context */
    title: 'swig template test', 
    add: "123456",
   });
});
```