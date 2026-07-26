import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Star, MapPin, Clock, Award, Filter } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export function DoctorList() {
  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      rating: 4.9,
      reviews: 127,
      experience: '15 years',
      location: 'Heart Health Center, Downtown',
      nextAvailable: 'Tomorrow, 2:00 PM',
      verified: true
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'General Physician',
      rating: 4.8,
      reviews: 203,
      experience: '12 years',
      location: 'Main Medical Building',
      nextAvailable: 'Today, 4:30 PM',
      verified: true
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      specialty: 'Dermatologist',
      rating: 4.9,
      reviews: 156,
      experience: '10 years',
      location: 'Skin Care Clinic',
      nextAvailable: 'Apr 15, 10:00 AM',
      verified: true
    },
    {
      id: 4,
      name: 'Dr. David Park',
      specialty: 'Orthopedic Surgeon',
      rating: 4.7,
      reviews: 98,
      experience: '18 years',
      location: 'Orthopedic Institute',
      nextAvailable: 'Apr 16, 9:30 AM',
      verified: true
    }
  ];

  return (
      <div className="min-h-screen bg-background">
        <Navbar userRole="patient" />

        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-heading mb-3" style={{ fontWeight: 600 }}>
              Recommended Doctors
            </h1>
            <p className="text-lg text-muted-foreground">
              Based on your symptoms and preferences
            </p>
          </motion.div>

          <div className="flex gap-4 mb-8">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              Specialty
            </Button>
            <Button variant="outline" size="sm">
              Availability
            </Button>
            <Button variant="outline" size="sm">
              Location
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {doctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="h-full">
                  <div className="flex gap-4 mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-heading mb-1" style={{ fontWeight: 600 }}>
                            {doctor.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {doctor.specialty}
                          </p>
                        </div>
                        {doctor.verified && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-secondary/10 text-secondary rounded-lg text-xs">
                            <Award className="w-3 h-3" />
                            Verified
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>{doctor.rating}</span>
                          <span className="text-muted-foreground">({doctor.reviews})</span>
                        </div>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{doctor.experience}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{doctor.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Next available: <span className="text-primary">{doctor.nextAvailable}</span></span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link to={`/patient/doctors/${doctor.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Profile
                      </Button>
                    </Link>
                    <Link to={`/patient/book/${doctor.id}`} className="flex-1">
                      <Button variant="primary" className="w-full">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
  );
}
