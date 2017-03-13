using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SkypeDemo.Story4.DoctorPortal.Controllers
{
    public class AccountController : Controller
    {
        public ActionResult Login()
        {
            ViewData["apiKey"] = ConfigurationManager.AppSettings["apiKey"];
            return View();
        }
    }
}