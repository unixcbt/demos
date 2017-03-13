using SkypeDemo.Story4.DoctorPortal.Models;
using SkypeDemo.Story4.DoctorPortal.ViewModels;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Xml.Linq;

namespace SkypeDemo.Story4.DoctorPortal.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewData["apiKey"] = ConfigurationManager.AppSettings["apiKey"];
            string userSip = Request.QueryString["sip"];
            string userPassword = Request.QueryString["pw"];
            string patientSip = Request.QueryString["patient"];

            string displayName = Request.QueryString["displayName"];
            string calendarImage = null;

            var patient = GetPatientBySip(patientSip);

            if (patient != null)
            {
                displayName = string.IsNullOrEmpty(displayName) ? patient.DisplayName : displayName;
                calendarImage = patient.CalendarImage;
            }

            var vm = new AppointmentViewModel()
            {
                SkypeUserId = !string.IsNullOrEmpty(userSip) ? userSip : ConfigurationManager.AppSettings["skypeUserId"],
                SkypePassword = !string.IsNullOrEmpty(userPassword) ? userPassword : ConfigurationManager.AppSettings["skypePassword"],
                EndpointSip = ConfigurationManager.AppSettings["endpointSip"],
                DisplayName = displayName,
                CalendarImage = calendarImage,
                PatientId = patientSip,
                DefaultDisplayName = ConfigurationManager.AppSettings["patientDisplayName"],
            };
            return View(vm);
        }

        [HttpPost]
        public ActionResult Index(AppointmentViewModel vm)
        {
            return RedirectToAction("Appointment", new { conferenceUri = vm.ConferenceUri, sip = vm.SkypeUserId, pw = vm.SkypePassword, patient = vm.PatientId, displayName = vm.DisplayName });
        }

        public ActionResult Appointment(string conferenceUri, string sip, string pw, string patient, string displayName)
        {
            
            ViewData["apiKey"] = ConfigurationManager.AppSettings["apiKey"];

            string appointmentImage = null;

            patient = !string.IsNullOrEmpty(patient) ? patient : ConfigurationManager.AppSettings["patientSip"];

            var patientLookup = GetPatientBySip(patient);

            if (patientLookup != null)
            {
                if (string.IsNullOrEmpty(displayName))
                    displayName = patientLookup.DisplayName;

                appointmentImage = patientLookup.AppointmentImage;
            }

            if (string.IsNullOrEmpty(displayName))
            {
                displayName = ConfigurationManager.AppSettings["patientDisplayName"];
            }

            return View(new AppointmentViewModel()
            {
                SkypeUserId = !string.IsNullOrEmpty(sip) ? sip : ConfigurationManager.AppSettings["skypeUserId"],
                SkypePassword = !string.IsNullOrEmpty(pw) ? pw : ConfigurationManager.AppSettings["skypePassword"],
                EndpointSip = ConfigurationManager.AppSettings["endpointSip"],
                DisplayName = displayName,
                AppointmentImage = appointmentImage,
                ConferenceUri = conferenceUri,
                PatientId = patient,
                DefaultDisplayName = ConfigurationManager.AppSettings["patientDisplayName"],
            });
        }


        private Patient GetPatientBySip(string patientSip)
        {
            try
            {
                var path = Server.MapPath(@"~/Content/Patients.xml");

                XDocument doc = XDocument.Load(path);

                var patients = doc.Root.Descendants("Patient")
                                   .Select(p => new Patient()
                                   {
                                       DisplayName = p.Element("DisplayName").Value,
                                       SipAddress = p.Element("SipAddress").Value,
                                       AppointmentImage = p.Element("AppointmentImage").Value,
                                       CalendarImage = p.Element("CalendarImage").Value,
                                   })
                                   .ToList();

                if (patients != null)
                {
                    return patients.FirstOrDefault(p => p.SipAddress == patientSip);
                }
            }
            catch { }

            return null;
        }
    }
}