using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SkypeDemo.Story4.DoctorPortal.ViewModels
{
    public class AppointmentViewModel
    {
        private int _month { get; set; }
        private int _startDay { get; set; }

        public string ConferenceUri { get; set; }
        public string SkypeUserId { get; set; }
        public string SkypePassword { get; set; }
        public string EndpointSip { get; set; }
        public string PatientId { get; set; }
        public string DisplayName { get; set; }
        public string CalendarImage { get; set; }
        public string AppointmentImage { get; set; }
        public string DefaultDisplayName { get; set; }

        public AppointmentViewModel()
        {
            var dt = DateTime.Today;
            var monday = dt.AddDays((int)dt.DayOfWeek - 1);
            Monday = string.Format("{0}/{1}", monday.Month, monday.Day);
            Tuesday = string.Format("{0}/{1}", monday.AddDays(1).Month, monday.AddDays(1).Day);
            Wednesday = string.Format("{0}/{1}", monday.AddDays(2).Month, monday.AddDays(2).Day);
            Thursday = string.Format("{0}/{1}", monday.AddDays(3).Month, monday.AddDays(3).Day);
            Friday = string.Format("{0}/{1}", monday.AddDays(4).Month, monday.AddDays(4).Day);
        }

        public string Monday { get; set; }
        public string Tuesday { get; set; }
        public string Wednesday { get; set; }
        public string Thursday { get; set; }
        public string Friday { get; set; }
    }
}