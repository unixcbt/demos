using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SkypeDemo.Story4.DoctorPortal.Models
{
    public class Patient
    {
        public string DisplayName { get; set; }
        public string SipAddress { get; set; }
        public string CalendarImage { get; set; }
        public string AppointmentImage { get; set; }
    }
}