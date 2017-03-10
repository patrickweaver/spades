[HTML5 Boilerplate homepage](https://html5boilerplate.com) | [Documentation
table of contents](TOC.md)

# Miscellaneous

* [crossdomain.xml](#crossdomainxml)
* [robots.txt](#robotstxt)
* [browserconfig.xml](#browserconfigxml)

--

## crossdomain.xml

The _cross-domain policy file_ is an XML document that gives a web client —
such as Adobe Flash Player, Adobe Reader, etc. — permission to handle data
across multiple domains, by:

 * granting read access to data
 * permitting the client to include custom headers in cross-domain requests
 * granting permissions for socket-based connections

__e.g.__ If a client hosts content from a particular source domain and that
content makes requests directed towards a domain other than its own, the remote
domain would need to host a cross-domain policy file in order to grant access
to the source domain and allow the client to continue with the transaction.

For more in-depth information, please see Adobe's [cross-domain policy file
specification](https://www.adobe.com/devnet/articles/crossdomain_policy_file_spec.html).


## robots.txt

The `robots.txt` file is used to give instructions to web robots on what can
be crawled from the website.

By default, the file provided by this project includes the next two lines:

 * `User-agent: *` -  the following rules apply to all web robots
 * `Disallow:` - everything on the website is allowed to be crawled

If you want to disallow certain pages you will need to specify the path in a
`Disallow` directive (e.g.: `Disallow: /path`) or, if you want to disallow
crawling of all content, use `Disallow: /`.

The `/robots.txt` file is not intended for access control, so don't try to
use it as such. Think of it as a "No Entry" sign, rather than a locked door.
URLs disallowed by the `robots.txt` file might still be indexed without being
crawled, and the content from within the `robots.txt` file can be viewed by
anyone, potentially disclosing the location of your private content! So, if
you want to block access to private content, use proper authentication instead.

For more information about `robots.txt`, please see:

  * [robotstxt.org](http://www.robotstxt.org/)
  * [How Google handles the `robots.txt` file](https://developers.google.com/webmasters/control-crawl-index/docs/robots_txt)


## browserconfig.xml

The `browserconfig.xml` file is used to customize the tile displayed when users
pin your site to the Windows 8.1 start screen. In there you can define custom
tile colors, custom images or even [live tiles](https://msdn.microsoft.com/en-us/library/ie/dn455106.aspx#CreatingLiveTiles).

By default, the file points to 2 placeholder tile images:

* `tile.png` (558x558px): used for `Small`, `Medium` and `Large` tiles.
  This image resizes automatically when necessary.
* `tile-wide.png` (558x270px): user for `Wide` tiles.

Notice that IE11 uses the same images when adding a site to the `favorites`.

For more in-depth information about the `browserconfig.xml` file, please
see [MSDN](https://msdn.microsoft.com/en-us/library/ie/dn320426.aspx).
