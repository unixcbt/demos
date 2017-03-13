using System.Web;
using System.Web.Mvc;

namespace SkypeDemo.Story4.DoctorPortal
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }
    }
}
