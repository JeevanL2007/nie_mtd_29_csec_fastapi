import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from './api';

function TicketForm() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [form, setForm] = useState({
        title: '',
        description: '',
        category: '',
        status: 'NEW'
    });

    const token = localStorage.getItem('token');

    // If editing an existing request
    useEffect(() => {

        if (id) {
            getRequest();
        }

    }, [id]);


    const getRequest = async () => {

        try {

            const response = await api.get(
                `/tickets/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setForm(response.data);

        } catch (error) {

            alert(
                error.response?.data?.detail ||
                'Unable to load request'
            );
        }
    };


    const saveRequest = async () => {

        // Basic validation
        if (
            !form.title ||
            !form.description ||
            !form.category
        ) {

            alert('Please fill all the fields');

            return;
        }


        try {

            // EDIT existing request
            if (id) {

                await api.put(
                    `/tickets/${id}`,
                    form,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                alert('HR request updated successfully');

            }

            // CREATE new request
            else {

                await api.post(
                    '/tickets',
                    form,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                alert('HR request created successfully');
            }

            navigate('/requests');

        } catch (error) {

            alert(
                error.response?.data?.detail ||
                'Unable to save request'
            );
        }
    };


    return (

        <div className="container mt-4">

            <div
                className="card p-4 mx-auto"
                style={{ maxWidth: '600px' }}
            >

                <h2 className="mb-4">

                    {id
                        ? 'Edit HR Service Request'
                        : 'Raise HR Service Request'}

                </h2>


                {/* TITLE */}

                <label className="form-label">
                    Request Title
                </label>

                <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Example: Leave approval"
                    value={form.title}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            title: e.target.value
                        })
                    }
                />


                {/* DESCRIPTION */}

                <label className="form-label">
                    Description
                </label>

                <textarea
                    className="form-control mb-3"
                    rows="5"
                    placeholder="Describe your HR issue..."
                    value={form.description}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            description: e.target.value
                        })
                    }
                />


                {/* CATEGORY */}

                <label className="form-label">
                    HR Category
                </label>

                <select
                    className="form-select mb-3"
                    value={form.category}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            category: e.target.value
                        })
                    }
                >

                    <option value="">
                        Select Category
                    </option>

                    <option value="Leave">
                        Leave
                    </option>

                    <option value="Payroll">
                        Payroll
                    </option>

                    <option value="Attendance">
                        Attendance
                    </option>

                    <option value="Employee Benefits">
                        Employee Benefits
                    </option>

                    <option value="Recruitment">
                        Recruitment
                    </option>

                    <option value="Other HR Issue">
                        Other HR Issue
                    </option>

                </select>


                {/* STATUS */}

                <label className="form-label">
                    Status
                </label>

                <select
                    className="form-select mb-3"
                    value={form.status}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            status: e.target.value
                        })
                    }
                >

                    <option value="NEW">
                        NEW
                    </option>

                    <option value="ASSIGNED">
                        ASSIGNED
                    </option>

                    <option value="IN_PROGRESS">
                        IN PROGRESS
                    </option>

                    <option value="ON_HOLD">
                        ON HOLD
                    </option>

                    <option value="RESOLVED">
                        RESOLVED
                    </option>

                    <option value="CLOSED">
                        CLOSED
                    </option>

                </select>


                {/* BUTTON */}

                <button
                    className="btn btn-primary w-100"
                    onClick={saveRequest}
                >

                    {id
                        ? 'Update Request'
                        : 'Submit HR Request'}

                </button>

            </div>

        </div>
    );
}

export default TicketForm;